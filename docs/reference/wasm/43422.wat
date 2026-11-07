  (func (;43422;) (type 15) (param i32 i32 i32 i32 i32 i32 i32)
    (local i32 f32 f32 f32)
    global.get 0
    i32.const 96
    i32.sub
    local.tee 6
    global.set 0
    i32.const 4366813
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356080
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3361776
      call 2180
      i32.const 3364124
      call 2180
      i32.const 3420048
      call 2180
      i32.const 3420056
      call 2180
      i32.const 3420124
      call 2180
      i32.const 3420152
      call 2180
      i32.const 3420172
      call 2180
      i32.const 3429524
      call 2180
      i32.const 3429536
      call 2180
      i32.const 3429540
      call 2180
      i32.const 3369320
      call 2180
      i32.const 3369312
      call 2180
      i32.const 4366813
      i32.const 1
      i32.store8
    end
    local.get 6
    i32.const 0
    i32.store offset=88
    local.get 6
    i64.const 0
    i64.store offset=80
    i32.const 3369320
    i32.load
    call 1900
    local.tee 7
    local.get 1
    i32.store offset=28
    local.get 7
    local.get 0
    i32.store offset=24
    local.get 7
    local.get 4
    i32.store offset=20
    local.get 7
    local.get 2
    i32.store offset=12
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 1
          i32.eqz
          br_if 0 (;@3;)
          local.get 1
          i32.load offset=8
          local.set 1
          i32.const 3360788
          i32.load
          local.tee 0
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 0
            call 60460
          end
          block  ;; label = @4
            local.get 1
            i32.const 0
            i32.const 0
            call 48872
            br_if 0 (;@4;)
            local.get 7
            i32.load offset=12
            local.set 1
            i32.const 3360788
            i32.load
            local.tee 0
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 0
              call 60460
            end
            local.get 1
            i32.const 0
            i32.const 0
            call 48872
            br_if 0 (;@4;)
            i32.const 3360788
            i32.load
            local.tee 1
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 1
              call 60460
            end
            local.get 3
            i32.const 0
            i32.const 0
            call 48872
            i32.eqz
            br_if 2 (;@2;)
          end
          local.get 7
          i32.load offset=28
          local.tee 1
          i32.eqz
          br_if 0 (;@3;)
          local.get 1
          i32.const 0
          i32.store8 offset=20
        end
        local.get 7
        i32.load offset=12
        local.tee 7
        i32.eqz
        br_if 1 (;@1;)
        local.get 7
        local.get 7
        i32.load offset=100
        i32.const 1
        i32.sub
        local.tee 1
        i32.const 0
        local.get 1
        i32.const 0
        i32.gt_s
        select
        i32.store offset=100
        br 1 (;@1;)
      end
      local.get 7
      local.get 7
      i32.load offset=28
      local.tee 1
      i32.load offset=8
      local.tee 0
      i32.store offset=32
      local.get 7
      local.get 1
      i32.load offset=12
      i32.store offset=16
      i32.const 0
      local.set 1
      local.get 0
      i32.const 0
      call 48828
      local.tee 0
      if  ;; label = @2
        local.get 0
        i32.const 0
        local.get 0
        i32.load
        i32.const 3361776
        i32.load
        i32.eq
        select
        local.set 1
      end
      i32.const 3360788
      i32.load
      local.tee 0
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 0
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        local.get 7
        i32.load offset=28
        i32.const 0
        i32.store8 offset=20
        local.get 7
        i32.load offset=12
        local.tee 7
        local.get 7
        i32.load offset=100
        i32.const 1
        i32.sub
        local.tee 7
        i32.const 0
        local.get 7
        i32.const 0
        i32.gt_s
        select
        i32.store offset=100
        br 1 (;@1;)
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 7821
      drop
      local.get 6
      i32.const -64
      i32.sub
      local.get 1
      i32.const 0
      call 49493
      local.get 6
      f32.load offset=72
      local.set 8
      local.get 6
      f32.load offset=68
      local.set 9
      local.get 6
      f32.load offset=64
      local.set 10
      i32.const 4377531
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377531
        i32.const 1
        i32.store8
      end
      local.get 6
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 0
      i32.load offset=20
      i32.store offset=88
      local.get 6
      local.get 0
      i64.load offset=12 align=4
      i64.store offset=80
      local.get 7
      i32.const 0
      i32.store8 offset=8
      i32.const 3356080
      i32.load
      local.tee 0
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 0
        call 60460
      end
      i32.const 0
      call 7600
      local.tee 0
      local.get 5
      f32.convert_i32_s
      f32.const 0x1.eb851ep-4 (;=0.12;)
      f32.mul
      i32.const 3420124
      i32.load
      call 14786
      drop
      local.get 8
      f32.const 0x1.333334p+0 (;=1.2;)
      f32.mul
      local.set 8
      local.get 9
      f32.const 0x1.333334p+0 (;=1.2;)
      f32.mul
      local.set 9
      local.get 10
      f32.const 0x1.333334p+0 (;=1.2;)
      f32.mul
      local.set 10
      i32.const 3369312
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
        i32.const 3369312
        i32.load
        local.set 2
      end
      local.get 2
      i32.load offset=92
      i32.load offset=8
      local.tee 4
      i32.eqz
      if  ;; label = @2
        local.get 2
        i32.load offset=116
        if (result i32)  ;; label = @3
          local.get 2
        else
          local.get 2
          call 60460
          i32.const 3369312
          i32.load
        end
        i32.load offset=92
        i32.load
        local.set 2
        i32.const 3364124
        i32.load
        call 1900
        local.tee 4
        local.get 2
        i32.const 3429524
        i32.load
        i32.const 0
        call 7547
        i32.const 3369312
        i32.load
        i32.load offset=92
        local.get 4
        i32.store offset=8
      end
      local.get 0
      local.get 4
      i32.const 0
      call 7954
      drop
      local.get 6
      i32.const 56
      i32.add
      local.tee 2
      local.get 8
      f32.store
      local.get 6
      local.get 2
      i32.load
      i32.store offset=40
      local.get 6
      local.get 9
      f32.store offset=52
      local.get 6
      local.get 10
      f32.store offset=48
      local.get 6
      local.get 6
      i64.load offset=48
      i64.store offset=32
      local.get 0
      local.get 1
      local.get 6
      i32.const 32
      i32.add
      f32.const 0x1.eb851ep-4 (;=0.12;)
      i32.const 0
      call 7781
      i32.const 6
      i32.const 3420152
      i32.load
      call 14789
      i32.const 0
      call 7801
      drop
      local.get 6
      i32.const -64
      i32.sub
      local.get 3
      i32.const 0
      call 49468
      local.get 6
      local.get 6
      i32.load offset=72
      i32.store offset=24
      local.get 6
      local.get 6
      i64.load offset=64
      i64.store offset=16
      local.get 0
      local.get 1
      local.get 6
      i32.const 16
      i32.add
      f32.const 0x1.99999ap-2 (;=0.4;)
      i32.const 0
      i32.const 0
      call 7767
      i32.const 7
      i32.const 3420152
      i32.load
      call 14789
      i32.const 0
      call 7801
      drop
      local.get 6
      local.get 6
      i32.load offset=88
      i32.store offset=8
      local.get 6
      local.get 6
      i64.load offset=80
      i64.store
      local.get 0
      local.get 1
      local.get 6
      f32.const 0x1.99999ap-2 (;=0.4;)
      i32.const 0
      call 7781
      i32.const 5
      i32.const 3420152
      i32.load
      call 14789
      i32.const 0
      call 7802
      drop
      local.get 0
      local.get 7
      i32.load offset=32
      i32.const 6
      i32.const 3420172
      i32.load
      call 14799
      drop
      i32.const 3364124
      i32.load
      call 1900
      local.tee 1
      local.get 7
      i32.const 3429536
      i32.load
      i32.const 0
      call 7547
      local.get 0
      local.get 1
      i32.const 3420048
      i32.load
      call 14773
      drop
      i32.const 3364124
      i32.load
      call 1900
      local.tee 1
      local.get 7
      i32.const 3429540
      i32.load
      i32.const 0
      call 7547
      local.get 0
      local.get 1
      i32.const 3420056
      i32.load
      call 14774
      drop
    end
    local.get 6
    i32.const 96
    i32.add
    global.set 0)
