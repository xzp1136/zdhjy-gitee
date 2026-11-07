  (func (;43404;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const -64
    i32.add
    local.tee 1
    global.set 0
    i32.const 4366746
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3376296
      call 2180
      i32.const 3359256
      call 2180
      i32.const 3389752
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3387844
      call 2180
      i32.const 3389756
      call 2180
      i32.const 3387848
      call 2180
      i32.const 3385856
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3415776
      call 2180
      i32.const 3478012
      call 2180
      i32.const 3435564
      call 2180
      i32.const 3482648
      call 2180
      i32.const 4366746
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=92
      local.tee 2
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 2
      local.get 0
      i32.load offset=84
      local.tee 4
      i32.load offset=12
      i32.ge_s
      br_if 0 (;@1;)
      local.get 4
      local.get 2
      local.get 1
      i32.const 32
      i32.add
      i32.const 3385856
      i32.load
      call 50458
      local.get 1
      i32.load offset=32
      i32.const 0
      local.get 1
      i32.const 32
      i32.add
      i32.const 3387848
      i32.load
      call 50458
      local.get 0
      local.get 1
      i32.load offset=32
      i32.store offset=68
      local.get 0
      i32.load offset=84
      local.get 0
      i32.load offset=92
      local.get 1
      i32.const 32
      i32.add
      i32.const 3385856
      i32.load
      call 50458
      local.get 1
      i32.load offset=32
      i32.const 1
      local.get 1
      i32.const 32
      i32.add
      i32.const 3387848
      i32.load
      call 50458
      local.get 0
      local.get 1
      i32.load offset=32
      i32.store offset=72
      i32.const 4366781
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3400800
        call 2180
        i32.const 4366781
        i32.const 1
        i32.store8
      end
      local.get 0
      i32.const 72
      i32.add
      local.set 4
      local.get 1
      i64.const 0
      i64.store offset=56
      local.get 1
      i32.const 16
      i32.add
      i32.const 0
      call 52074
      local.get 1
      local.get 1
      i64.load offset=24
      i64.store offset=44 align=4
      local.get 1
      i32.const -1
      i32.store offset=32
      local.get 1
      local.get 1
      i64.load offset=16
      i64.store offset=36 align=4
      local.get 1
      local.get 0
      i32.store offset=52
      local.get 1
      i32.const 32
      i32.add
      i32.const 4
      i32.or
      local.get 1
      i32.const 32
      i32.add
      i32.const 3400800
      i32.load
      call 45227
      block  ;; label = @2
        local.get 0
        i32.load offset=92
        local.tee 3
        local.get 0
        i32.load offset=88
        local.tee 2
        i32.load offset=12
        i32.ge_s
        br_if 0 (;@2;)
        local.get 2
        local.get 3
        local.get 1
        i32.const 32
        i32.add
        i32.const 3385856
        i32.load
        call 50458
        local.get 1
        i32.load offset=32
        i32.load offset=12
        i32.const 0
        i32.le_s
        br_if 0 (;@2;)
        local.get 0
        i32.load offset=88
        local.get 0
        i32.load offset=92
        local.get 1
        i32.const 32
        i32.add
        i32.const 3385856
        i32.load
        call 50458
        local.get 1
        i32.load offset=32
        i32.const 0
        local.get 1
        i32.const 32
        i32.add
        i32.const 3387848
        i32.load
        call 50458
        local.get 1
        i32.load offset=32
        local.set 3
        i32.const 3359256
        i32.load
        local.tee 2
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 2
          call 60460
          i32.const 3359256
          i32.load
          local.set 2
        end
        i32.const 3376296
        i32.load
        local.set 5
        local.get 2
        i32.load offset=92
        i32.load
        local.set 2
        local.get 1
        local.get 0
        i32.load offset=68
        i32.store offset=32
        local.get 2
        local.get 1
        i32.const 32
        i32.add
        local.get 1
        i32.const 16
        i32.add
        local.get 5
        call 34434
        local.get 3
        i32.const 0
        i32.lt_s
        br_if 0 (;@2;)
        local.get 3
        local.get 1
        i32.load offset=16
        i32.load offset=16
        local.tee 2
        i32.load offset=12
        i32.ge_s
        br_if 0 (;@2;)
        local.get 2
        i32.const 0
        local.get 1
        i32.const 32
        i32.add
        i32.const 3389756
        i32.load
        call 50458
        local.get 1
        i32.load offset=32
        local.set 2
        i32.const 0
        call 56067
        i32.load offset=264
        local.get 2
        i32.const 0
        call 48049
        i32.const 3415776
        i32.load
        call 24700
        local.set 3
        i32.const 3360788
        i32.load
        local.tee 5
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 5
          call 60460
        end
        local.get 3
        i32.const 0
        i32.const 0
        call 48812
        if  ;; label = @3
          local.get 0
          i32.load offset=44
          i32.const 0
          call 48736
          i32.const 1
          i32.const 0
          call 48833
          local.get 0
          i32.load offset=44
          local.get 3
          i32.const 0
          call 20479
          local.get 0
          i32.load offset=44
          local.tee 2
          local.get 2
          i32.load
          local.tee 2
          i32.load offset=556
          local.get 2
          i32.load offset=552
          call_indirect (type 1)
          local.get 0
          i32.load offset=44
          i32.const 0
          call 48735
          local.set 2
          i32.const 4377531
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3364792
            call 2180
            i32.const 4377531
            i32.const 1
            i32.store8
          end
          local.get 1
          i32.const 3364792
          i32.load
          i32.load offset=92
          local.tee 3
          i32.load offset=20
          i32.store offset=8
          local.get 1
          local.get 3
          i64.load offset=12 align=4
          i64.store
          local.get 2
          local.get 1
          i32.const 0
          call 49495
          br 1 (;@2;)
        end
        i32.const 3435564
        i32.load
        local.get 2
        i32.const 3482648
        i32.load
        i32.const 0
        call 48222
        local.set 2
        i32.const 3356428
        i32.load
        local.tee 3
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 3
          call 60460
        end
        local.get 2
        i32.const 0
        call 55817
      end
      local.get 0
      i32.load offset=48
      local.set 2
      local.get 4
      i32.const 0
      call 53141
      local.set 4
      local.get 2
      i32.const 3478012
      i32.load
      local.get 4
      i32.const 0
      call 48049
      local.get 2
      i32.load
      local.tee 4
      i32.load offset=796
      local.get 4
      i32.load offset=792
      call_indirect (type 2)
      local.get 0
      local.get 1
      call 43442
      local.get 0
      local.get 1
      call 43443
      local.get 0
      local.get 1
      call 43444
    end
    local.get 1
    i32.const -64
    i32.sub
    global.set 0)
