  (func (;43553;) (type 11) (param i32 i32 i32 i32 i32 i32)
    (local i32 i32 i64 i64)
    global.get 0
    i32.const 96
    i32.sub
    local.tee 6
    global.set 0
    i32.const 4366825
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354340
      call 2180
      i32.const 3408116
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3415768
      call 2180
      i32.const 3429552
      call 2180
      i32.const 3369332
      call 2180
      i32.const 3453720
      call 2180
      i32.const 4366825
      i32.const 1
      i32.store8
    end
    i32.const 3369332
    i32.load
    call 1900
    local.tee 5
    local.get 4
    i32.store offset=8
    i32.const 3360788
    i32.load
    local.tee 4
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 4
      call 60460
    end
    block  ;; label = @1
      local.get 2
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        local.get 5
        i32.load offset=8
        local.tee 5
        i32.eqz
        br_if 1 (;@1;)
        local.get 5
        i32.load offset=32
        i32.const 0
        local.get 5
        i32.load offset=20
        local.get 5
        i32.load offset=12
        call_indirect (type 2)
        br 1 (;@1;)
      end
      local.get 0
      i32.load offset=64
      local.set 4
      i32.const 3360788
      i32.load
      local.tee 7
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 7
        call 60460
      end
      block  ;; label = @2
        local.get 4
        i32.const 0
        i32.const 0
        call 48872
        i32.eqz
        if  ;; label = @3
          local.get 0
          i32.load offset=64
          local.set 4
          br 1 (;@2;)
        end
        local.get 0
        i32.const 3453720
        i32.load
        i32.const 3415768
        i32.load
        call 24700
        local.tee 4
        i32.store offset=64
      end
      i32.const 3360788
      i32.load
      local.tee 7
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 7
        call 60460
      end
      local.get 4
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        local.get 5
        i32.load offset=8
        local.tee 5
        i32.eqz
        br_if 1 (;@1;)
        local.get 5
        i32.load offset=32
        i32.const 0
        local.get 5
        i32.load offset=20
        local.get 5
        i32.load offset=12
        call_indirect (type 2)
        br 1 (;@1;)
      end
      i32.const 4367473
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360844
        call 2180
        i32.const 4367473
        i32.const 1
        i32.store8
      end
      i32.const 3360844
      i32.load
      i32.load offset=92
      i32.load
      local.get 0
      i32.load offset=64
      local.get 0
      i32.load offset=68
      i32.const 5
      i32.const 0
      call 43865
      local.set 0
      i32.const 3360788
      i32.load
      local.tee 4
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 4
        call 60460
      end
      local.get 0
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        local.get 5
        i32.load offset=8
        local.tee 5
        i32.eqz
        br_if 1 (;@1;)
        local.get 5
        i32.load offset=32
        i32.const 0
        local.get 5
        i32.load offset=20
        local.get 5
        i32.load offset=12
        call_indirect (type 2)
        br 1 (;@1;)
      end
      local.get 0
      i32.const 0
      call 48828
      local.set 4
      local.get 6
      local.get 1
      i32.load offset=8
      i32.store offset=40
      local.get 6
      local.get 1
      i64.load align=4
      i64.store offset=32
      local.get 4
      local.get 6
      i32.const 32
      i32.add
      i32.const 0
      call 49470
      local.get 0
      i32.const 0
      call 48828
      local.set 4
      i32.const 4377529
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3361564
        call 2180
        i32.const 4377529
        i32.const 1
        i32.store8
      end
      i32.const 3361564
      i32.load
      i32.load offset=92
      local.tee 1
      i64.load align=4
      local.set 8
      local.get 6
      local.get 1
      i64.load offset=8 align=4
      local.tee 9
      i64.store offset=24
      local.get 6
      local.get 9
      i64.store offset=88
      local.get 6
      local.get 8
      i64.store offset=80
      local.get 6
      local.get 8
      i64.store offset=16
      local.get 4
      local.get 6
      i32.const 16
      i32.add
      i32.const 0
      call 49478
      local.get 0
      i32.const 1
      i32.const 0
      call 48833
      local.get 0
      local.get 6
      i32.const -64
      i32.sub
      i32.const 3408116
      i32.load
      call 45354
      local.get 5
      local.get 6
      i32.load offset=64
      local.tee 4
      i32.store offset=12
      i32.const 3360788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      local.get 4
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        i32.const 4367473
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3360844
          call 2180
          i32.const 4367473
          i32.const 1
          i32.store8
        end
        i32.const 3360844
        i32.load
        i32.load offset=92
        i32.load
        local.get 0
        i32.const 0
        call 43866
        local.get 5
        i32.load offset=8
        local.tee 5
        i32.eqz
        br_if 1 (;@1;)
        local.get 5
        i32.load offset=32
        i32.const 0
        local.get 5
        i32.load offset=20
        local.get 5
        i32.load offset=12
        call_indirect (type 2)
        br 1 (;@1;)
      end
      local.get 6
      local.get 3
      local.get 6
      call 43554
      local.set 0
      local.get 5
      i32.load offset=12
      local.get 0
      i32.const 0
      call 44336
      local.get 6
      i32.const -64
      i32.sub
      local.get 2
      i32.const 0
      call 49468
      local.get 5
      i32.load offset=12
      local.set 0
      local.get 6
      i32.const 56
      i32.add
      local.tee 2
      local.get 6
      i32.load offset=72
      i32.store
      local.get 6
      local.get 6
      i64.load offset=64
      i64.store offset=48
      i32.const 3354340
      i32.load
      call 1900
      local.tee 4
      local.get 5
      i32.const 3429552
      i32.load
      i32.const 0
      call 38015
      local.get 6
      local.get 2
      i32.load
      i32.store offset=8
      local.get 6
      local.get 6
      i64.load offset=48
      i64.store
      local.get 0
      local.get 6
      local.get 4
      i32.const 0
      call 44338
    end
    local.get 6
    i32.const 96
    i32.add
    global.set 0)
