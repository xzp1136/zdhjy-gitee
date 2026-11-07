  (func (;43442;) (type 1) (param i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4366747
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3389752
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3389756
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3415776
      call 2180
      i32.const 3453076
      call 2180
      i32.const 4366747
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load8_u offset=77
    local.set 1
    local.get 0
    i32.load offset=40
    i32.const 0
    call 48736
    local.set 2
    block  ;; label = @1
      local.get 1
      if  ;; label = @2
        local.get 2
        i32.const 1
        i32.const 0
        call 48833
        local.get 0
        i32.load offset=80
        local.tee 1
        i32.const 0
        local.get 1
        i32.load offset=12
        i32.const 1
        i32.sub
        local.tee 2
        local.get 0
        i32.load offset=84
        i32.load offset=12
        local.get 0
        i32.load offset=92
        i32.const -1
        i32.xor
        i32.add
        local.tee 1
        local.get 1
        local.get 2
        i32.gt_s
        select
        local.get 1
        i32.const 0
        i32.lt_s
        select
        local.get 3
        i32.const 12
        i32.add
        i32.const 3389756
        i32.load
        call 50458
        i32.const 3453076
        i32.load
        local.get 3
        i32.load offset=12
        i32.const 0
        call 48049
        i32.const 3415776
        i32.load
        call 24700
        local.set 1
        i32.const 3360788
        i32.load
        local.tee 2
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 2
          call 60460
        end
        local.get 1
        i32.const 0
        i32.const 0
        call 48812
        if  ;; label = @3
          local.get 0
          i32.load offset=40
          local.get 1
          i32.const 0
          call 20479
        end
        local.get 0
        i32.load offset=92
        i32.const 0
        i32.le_s
        br_if 1 (;@1;)
        local.get 0
        i32.load offset=40
        i32.const 0
        call 48735
        local.set 2
        i32.const 4366753
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3369204
          call 2180
          i32.const 4366753
          i32.const 1
          i32.store8
        end
        i32.const 3369204
        i32.load
        call 1900
        local.tee 1
        i32.const 0
        i32.store8 offset=24
        local.get 1
        local.get 2
        i32.store offset=20
        local.get 1
        local.get 0
        i32.store offset=16
        local.get 1
        i32.const 0
        i32.store offset=8
        local.get 0
        local.get 1
        i32.const 0
        call 48887
        drop
        br 1 (;@1;)
      end
      local.get 2
      i32.const 0
      i32.const 0
      call 48833
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
