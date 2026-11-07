  (func (;44284;) (type 2) (param i32 i32 i32)
    (local i32 i32 i64 i64)
    global.get 0
    i32.const -64
    i32.add
    local.tee 3
    global.set 0
    i32.const 4367398
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3408288
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3415768
      call 2180
      i32.const 3366308
      call 2180
      i32.const 3428280
      call 2180
      i32.const 3367756
      call 2180
      i32.const 3464440
      call 2180
      i32.const 3453664
      call 2180
      i32.const 4367398
      i32.const 1
      i32.store8
    end
    i32.const 3367756
    i32.load
    call 1900
    local.set 4
    i32.const 4367473
    i32.load8_u
    i32.eqz
    if  ;; label = @1
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
    local.set 0
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    block  ;; label = @1
      local.get 0
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      i32.const 4367477
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360984
        call 2180
        i32.const 4367477
        i32.const 1
        i32.store8
      end
      i32.const 3360984
      i32.load
      i32.load offset=92
      i32.load
      local.set 0
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 0
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      i32.const 4367477
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360984
        call 2180
        i32.const 4367477
        i32.const 1
        i32.store8
      end
      i32.const 3360984
      i32.load
      i32.load offset=92
      i32.load
      i32.load offset=92
      local.set 0
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 0
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        i32.const 4367477
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3360984
          call 2180
          i32.const 4367477
          i32.const 1
          i32.store8
        end
        i32.const 3360984
        i32.load
        i32.load offset=92
        i32.load
        i32.const 3453664
        i32.load
        i32.const 3415768
        i32.load
        call 24700
        i32.store offset=92
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
        local.set 0
        i32.const 4367477
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3360984
          call 2180
          i32.const 4367477
          i32.const 1
          i32.store8
        end
        local.get 0
        i32.const 3360984
        i32.load
        i32.load offset=92
        i32.load
        i32.load offset=92
        i32.const 0
        i32.const 1
        i32.const 0
        call 43864
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
      local.set 0
      i32.const 4367477
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360984
        call 2180
        i32.const 4367477
        i32.const 1
        i32.store8
      end
      local.get 4
      local.get 0
      i32.const 3360984
      i32.load
      i32.load offset=92
      i32.load
      i32.load offset=92
      i32.const 0
      i32.const 5
      i32.const 0
      call 43865
      local.tee 0
      i32.store offset=8
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 0
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 4
      i32.load offset=8
      i32.const 0
      call 48828
      local.set 0
      local.get 3
      local.get 1
      i32.load offset=8
      i32.store offset=32
      local.get 3
      local.get 1
      i64.load align=4
      i64.store offset=24
      local.get 0
      local.get 3
      i32.const 24
      i32.add
      i32.const 0
      call 49470
      local.get 4
      i32.load offset=8
      i32.const 0
      call 48828
      local.set 0
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
      local.tee 2
      i64.load align=4
      local.set 5
      local.get 3
      local.get 2
      i64.load offset=8 align=4
      local.tee 6
      i64.store offset=16
      local.get 3
      local.get 6
      i64.store offset=48
      local.get 3
      local.get 5
      i64.store offset=40
      local.get 3
      local.get 5
      i64.store offset=8
      local.get 0
      local.get 3
      i32.const 8
      i32.add
      i32.const 0
      call 49478
      local.get 4
      i32.load offset=8
      local.get 3
      i32.const 60
      i32.add
      i32.const 3408288
      i32.load
      call 45354
      local.get 4
      local.get 3
      i32.load offset=60
      local.tee 0
      i32.store offset=12
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 0
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
        local.get 4
        i32.load offset=8
        i32.const 0
        call 43866
        br 1 (;@1;)
      end
      local.get 4
      i32.load offset=12
      i32.const 0
      call 40776
      i32.const 0
      call 16516
      local.get 4
      i32.load offset=12
      i32.const 0
      call 40723
      i32.const 0
      call 16356
      local.get 4
      i32.load offset=12
      i32.const 0
      call 40776
      i32.const 0
      i32.const 3464440
      i32.load
      i32.const 0
      i32.const 0
      call 16521
      local.set 0
      i32.const 3366308
      i32.load
      call 1900
      local.tee 2
      local.get 4
      i32.const 3428280
      i32.load
      i32.const 0
      call 16538
      local.get 0
      local.get 2
      i32.const 0
      call 16548
    end
    local.get 3
    i32.const -64
    i32.sub
    global.set 0)
